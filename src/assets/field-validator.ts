import { ResolutionsEnum } from '../routes/videos-router'

export const titleFieldValidator = (
    title: string | undefined,
    errorsArray: Array<{ field: string; message: string }>
) => {
    if (!title) {
        errorsArray.push({ field: 'title', message: 'no title' })
    }
    if (title && title.trim().length > 40) {
        errorsArray.push({
            field: 'title',
            message: 'more than 40 symbols',
        })
    }
    if (title && title.trim().length < 1) {
        errorsArray.push({
            field: 'title',
            message: 'no title',
        })
    }
}
export const authorFieldValidator = (
    author: string | undefined,
    errorsArray: Array<{ field: string; message: string }>
) => {
    if (!author) {
        errorsArray.push({ field: 'author', message: 'no author' })
    }
    if (author && author.trim().length > 20) {
        errorsArray.push({
            field: 'author',
            message: 'more than 20 symbols',
        })
    }
    if (author && author.trim().length < 1) {
        errorsArray.push({
            field: 'author',
            message: 'no author',
        })
    }
}

export const availableResolutionsFieldValidator = (
    availableResolutions: Array<string>,
    errorsArray: Array<{ field: string; message: string }>
) => {
    if (availableResolutions && availableResolutions.length) {
        availableResolutions.forEach((resolution: string) => {
            if (!Object.keys(ResolutionsEnum).includes(resolution)) {
                errorsArray.push({
                    field: 'availableResolutions',
                    message: 'exist not valid value',
                })
                return
            }
        })
    }
}
export const canBeDownloadedFieldValidator = (
    canBeDownloaded: string | boolean | undefined,
    errorsArray: Array<{ field: string; message: string }>
) => {
    if (canBeDownloaded && typeof canBeDownloaded !== 'boolean') {
        errorsArray.push({
            field: 'canBeDownloaded',
            message: 'not boolean',
        })
    }
}

export const minAgeRestrictionFieldValidator = (
    minAgeRestriction: any | undefined,
    errorsArray: Array<{ field: string; message: string }>
) => {
    if (minAgeRestriction) {
        const res = parseInt(minAgeRestriction)
        if (!res || (res && res < 1) || (res && res > 18)) {
            errorsArray.push({
                field: 'minAgeRestriction',
                message: 'not correct',
            })
        }
    }
}

export const publicationDateFieldValidator = (
    publicationDate: any | undefined,
    errorsArray: Array<{ field: string; message: string }>
) => {
    if (
        publicationDate &&
        publicationDate.toString() == parseInt(publicationDate).toString()
    ) {
        errorsArray.push({
            field: 'publicationDate',
            message: 'not correct',
        })
    }

    let tryDate = new Date(publicationDate)
    // @ts-ignore
    if (tryDate && tryDate.toString() == 'NaN' && tryDate == 'Invalid Date') {
        errorsArray.push({
            field: 'publicationDate',
            message: 'not correct',
        })
    }
}
