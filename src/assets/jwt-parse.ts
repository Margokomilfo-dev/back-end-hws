export const getJWTPayload = (
    refreshToken: string
): { userId: string; deviceId: string; sessionId: string; iat: string } | null => {
    try {
        return JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64url').toString())
    } catch (error) {
        return null
    }
}
export const firstPartsOfJWTToken = (token: string) => {
    const arr = token.split('.')
    return arr[0] + '.' + arr[1]
}
