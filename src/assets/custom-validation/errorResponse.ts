export const errorResponse = (
    errorsArray: Array<{ message: string; field: string }>
) => {
    let errors_ = {
        errorsMessages: [] as Array<{ message: string; field: string }>,
    }
    errorsArray.forEach((err) => {
        errors_.errorsMessages.push(err)
    })

    return errors_
}
