import jsonwebtoken from 'jsonwebtoken'



export const jwtSign = (payload, expiresIn = '1d') =>
  jsonwebtoken.sign(payload," localsecret", { expiresIn })

export default {
  jwtSign,
}