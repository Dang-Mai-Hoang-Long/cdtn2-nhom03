const { truyVan } = require('../db');

// createdAt chỉ truyền khi ghi bù một dòng đã xảy ra trước đó; bỏ trống thì lấy thời điểm hiện tại.
async function them({ userId, userRole, action, targetType, targetId, status, httpStatus, route, device, os, createdAt = null }) {
  await truyVan(
    `INSERT INTO activity_log (user_id, user_role, action, target_type, target_id, status, http_status, route, device, os, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, coalesce($11::timestamptz, now()))`,
    [userId, userRole, action, targetType, targetId, status, httpStatus, route, device, os, createdAt],
  );
}

module.exports = { them };
