import { app } from './settings'
import { runDb } from './repositores/db'

const port = process.env.PORT || 3999

const startApp = async () => {
    await runDb()
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

startApp()
