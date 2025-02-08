export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err)
  
    // Ensure we always send JSON responses, even for errors
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    })
  }
  
  