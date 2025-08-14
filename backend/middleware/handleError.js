/* ==========================================================================================
   Middleware: handleError
   Purpose:
       Global Express error-handling middleware that catches and responds to unhandled errors.
       If headers have already been sent, it forwards the error to the default handler.
       Otherwise, it returns a custom 500 error page to the client.

   Parameters:
       err  - The error object thrown in the app.
       req  - The incoming HTTP request object.
       res  - The outgoing HTTP response object.
       next - Callback to pass control to the next middleware/error handler.

   Behavior:
       - Logs the error (optional for production)
       - Checks if headers are already sent
       - Sends a rendered "error" EJS page with a 500 status code
       - (Optional) Alternative JSON response is available (commented out)

   Usage:
       Import and use after all other routes:
           app.use(handleError);

========================================================================================== */
export function handleError(err, req, res, next) {
    // Optional: Log error for debugging (remove in production if not needed)
    console.error(err);

    // If headers already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    // Render a custom 500 error page
    res.status(500).render('error', {
        title: '500 Error',
        error: 'Server is currently down. Try again later',
    });

    /*
    // Optional: Return JSON instead of HTML
    res.status(500).json({
        title: '500 Error',
        error: 'Server is currently down. Try again later',
    });
    */
}
