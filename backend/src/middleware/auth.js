import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) =>
{
  const authHeader = req.header('Authorization')

  if (!authHeader)
  {
    return res.status(401).json(
    {
      message: "Unauthorized"
    })
  }

  const token = authHeader.split(' ')[1]

  try
  {
    const decode = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decode

    next()

  }
  catch (err)
  {
    return res.status(401).json(
    {
      message: "Unauthorized"
    })
  }
}

export default authMiddleware
