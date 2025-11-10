/**
 * Role-based access control middleware
 * Checks if user has required role(s) to access a route
 */

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

// Specific role checkers
const isAdmin = checkRole('admin');
const isAdminOrFaculty = checkRole('admin', 'faculty');
const isStudent = checkRole('student');

module.exports = {
  checkRole,
  isAdmin,
  isAdminOrFaculty,
  isStudent
};
