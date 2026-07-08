import jwt from 'jsonwebtoken'

/**
 * JWT Authentication Middleware
 * Protects routes by verifying the Bearer token in the Authorization header.
 * On success, attaches the decoded user payload to req.user for use in route handlers.
 */

const authMiddleware = (req, res, next) =>
{
  const authHeader = req.header('Authorization')

  // Reject requests with no Authorization header
  if (!authHeader)
  {
    return res.status(401).json(
    {
      message: "Unauthorized"
    })
  }

  // Extract the token from "Bearer <token>"
  const token = authHeader.split(' ')[1]

  try
  {
    // Verify signature and expiry against JWT_SECRET
    const decode = jwt.verify(token, process.env.JWT_SECRET)

    // Attach decoded payload (id, username, email) to the request object
    req.user = decode

    next()

  }
  catch (err)
  {
    // Invalid or expired token
    return res.status(401).json(
    {
      message: "Unauthorized"
    })
  }
}

export default authMiddleware
