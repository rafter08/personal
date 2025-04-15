const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cron = require("node-cron")
const Plan = require("./models/Plan")
const Wallet = require("./models/Wallet")
const dotenv = require("dotenv")
const app = express()
dotenv.config()
app.use(express.json())
app.use(cors())


mongoose
  .connect("mongodb+srv://vivekc08rct:Cvivek123@cluster0.zhy01ff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err))


app.use("/api/auth", require("./routes/auth"))
app.use("/api/plans", require("./routes/plans"))
app.use("/api/auth", require("./routes/forgotPasswordRoutes"));
app.use("/api/wallet", require("./routes/wallet"))
app.use("/api/referrals", require("./routes/referrals"))
app.use("/api/admin", require("./routes/admin"))


cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily earnings update...")

   
    const plans = await Plan.find({ status: "Active" })

    for (const plan of plans) {
      if (plan.lastEarningDate && new Date(plan.lastEarningDate).toDateString() === new Date().toDateString()) {
        continue
      }

      let wallet = await Wallet.findOne({ user: plan.user })

      if (!wallet) {
        wallet = new Wallet({ user: plan.user })
      }

      wallet.balance += plan.dailyReturn
      wallet.withdrawable += plan.dailyReturn

      wallet.transactions.push({
        type: "Earning",
        amount: plan.dailyReturn,
        planId: plan._id,
        status: "Completed",
      })

      await wallet.save()

     plan.lastEarningDate = new Date()
      plan.daysRemaining -= 1

      if (plan.daysRemaining <= 0) {
        plan.status = "Completed"
      }

      await plan.save()
    }

    console.log("Daily earnings update completed")
  } catch (err) {
    console.error("Error processing daily earnings:", err)
  }
})

const PORT = process.env.PORT 

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
