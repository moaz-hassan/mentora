

import { logAudit } from "../services/admin/logs.service.js";


const getActionType = (method, path) => {
  const methodMap = {
    POST: 'create',
    PUT: 'update',
    PATCH: 'update',
    DELETE: 'delete',
    GET: 'view'
  };

  return methodMap[method] || 'action';
};


const getResourceType = (path) => {
  
  const match = path.match(/\/api\/admin\/([^\/]+)/);
  if (match) {
    return match[1];
  }
  return 'unknown';
};


const getResourceId = (params) => {
  return params.id || params.courseId || params.userId || null;
};


const generateDescription = (method, resourceType, resourceId, body) => {
  const action = getActionType(method);
  const resource = resourceType.replace(/-/g, ' ');
  
  if (resourceId) {
    return `${action} ${resource} (ID: ${resourceId})`;
  }
  
  return `${action} ${resource}`;
};


export const auditLogMiddleware = async (req, res, next) => {
  
  if (!req.path.startsWith('/api/admin')) {
    return next();
  }

  
  if (req.method === 'GET') {
    return next();
  }

  
  if (!req.user || req.user.role !== 'admin') {
    return next();
  }

  
  const originalSend = res.send;
  let responseBody;

  res.send = function (data) {
    responseBody = data;
    originalSend.call(this, data);
  };

  
  res.on('finish', async () => {
    try {
      const actionType = getActionType(req.method, req.path);
      const resourceType = getResourceType(req.path);
      const resourceId = getResourceId(req.params);
      const description = generateDescription(req.method, resourceType, resourceId, req.body);

      
      const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failed';

      
      await logAudit({
        adminId: req.user.id,
        actionType,
        resourceType,
        resourceId,
        description,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          body: req.body,
          query: req.query
        }
      });
    } catch (error) {
      
      console.error('Audit logging error:', error);
    }
  });

  next();
};


export const logAdminAction = async (req, actionType, resourceType, resourceId, description, metadata = {}) => {
  if (!req.user || req.user.role !== 'admin') {
    return;
  }

  try {
    await logAudit({
      adminId: req.user.id,
      actionType,
      resourceType,
      resourceId,
      description,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      status: 'success',
      metadata
    });
  } catch (error) {
    console.error('Manual audit logging error:', error);
  }
};

export default auditLogMiddleware;
