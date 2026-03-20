
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100),
    Role NVARCHAR(20) DEFAULT 'Staff'
);

ALTER TABLE Users 
ADD Department NVARCHAR(50);
ALTER TABLE Users ADD IsLocked BIT DEFAULT 0;
ALTER TABLE Users ADD LockedUntil DATETIME NULL; -- Khóa có thời hạn

UPDATE Users 
SET Role = 'Admin' 
WHERE Username = 'admin';

INSERT INTO Users (Username, PasswordHash, FullName) VALUES ('Binh', 

SELECT * FROM Users

CREATE TABLE AuditLogs (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT, -- ID của người thực hiện
    Action NVARCHAR(50), -- LOGIN, UPLOAD, DOWNLOAD, DELETE, VIEW
    Resource NVARCHAR(255), -- Tên file hoặc đường dẫn API
    Status NVARCHAR(20), -- Success hoặc Failed
    IPAddress NVARCHAR(50),
    BrowserInfo NVARCHAR(MAX), -- Để biết họ dùng thiết bị gì
    CreatedAt DATETIME DEFAULT GETDATE()
);

SELECT * FROM AuditLogs

CREATE TABLE Documents (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(MAX) NOT NULL,
    OwnerId INT, -- ID người tải lên
    Department NVARCHAR(50), -- Tài liệu thuộc phòng ban nào (HR, Sales, IT...)
    IsPrivate BIT DEFAULT 0, -- 1 là chỉ chủ sở hữu mới thấy
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (OwnerId) REFERENCES Users(Id)
);

SELECT * FROM Documents
ALTER TABLE Documents 
ADD IsDeleted INT DEFAULT 0;
ALTER TABLE Documents 
ADD FileSize BIGINT;
ALTER TABLE Documents 
ADD IsDeleted BIT DEFAULT 0,
    DeletedAt DATETIME NULL;



UPDATE Documents 
SET IsDeleted = 0
WHERE id = 1;

WITH UserStats AS (
    -- Bước 1: Thống kê số lỗi theo từng ngày trong quá khứ
    SELECT 
        UserId, 
        CAST(CreatedAt AS DATE) as LogDate, 
        COUNT(*) as DailyViolations
    FROM AuditLogs
    WHERE Action = 'UNAUTHORIZED_ACCESS'
    GROUP BY UserId, CAST(CreatedAt AS DATE)
),
AggregatedStats AS (
    -- Bước 2: Tính Mean và Standard Deviation cho từng User
    SELECT 
        UserId,
        AVG(CAST(DailyViolations AS FLOAT)) as MeanValue,
        STDEV(DailyViolations) as StdDevValue
    FROM UserStats
    GROUP BY UserId
)
-- Bước 3: Tính Z-Score cho ngày hôm nay
SELECT 
    s.UserId,
    today.TodayCount,
    s.MeanValue,
    s.StdDevValue,
    (today.TodayCount - s.MeanValue) / NULLIF(s.StdDevValue, 0) as ZScore
FROM AggregatedStats s
JOIN (
    SELECT UserId, COUNT(*) as TodayCount 
    FROM AuditLogs 
    WHERE Action = 'UNAUTHORIZED_ACCESS' 
    AND CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)
    GROUP BY UserId
) today ON s.UserId = today.UserId;


-- API: /api/admin/suspicious-users
WITH UserStats AS (
    SELECT 
        u.Id, 
        u.Username, 
        u.IsLocked,
        u.LockedUntil,
        -- Tính Z-Score hiện tại (giống logic chúng ta đã làm)
        (SELECT COUNT(*) FROM AuditLogs WHERE UserId = u.Id AND Action = 'UNAUTHORIZED_ACCESS' AND CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)) as Today_Count
    FROM Users u
)
SELECT * FROM UserStats 
WHERE Today_Count > 0 
ORDER BY Today_Count DESC;


DECLARE @UserId INT = 4; -- ID User bạn đang dùng để test
DECLARE @Now DATETIME = GETDATE();

-- Ngày 1: Vi phạm 1 lần (Bình thường)
INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo, CreatedAt)
VALUES (@UserId, 'UNAUTHORIZED_ACCESS', '/api/documents/hr-report.pdf', 'Failed', '192.168.1.10', 'Mozilla/5.0', DATEADD(day, -4, @Now));

-- Ngày 2: Vi phạm 2 lần (Bình thường)
INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo, CreatedAt)
VALUES (@UserId, 'UNAUTHORIZED_ACCESS', '/api/documents/salary.xlsx', 'Failed', '192.168.1.10', 'Mozilla/5.0', DATEADD(day, -3, @Now));
INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo, CreatedAt)
VALUES (@UserId, 'UNAUTHORIZED_ACCESS', '/api/documents/salary.xlsx', 'Failed', '192.168.1.10', 'Mozilla/5.0', DATEADD(minute, 5, DATEADD(day, -3, @Now)));

-- Ngày 3: Vi phạm 1 lần (Bình thường)
INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo, CreatedAt)
VALUES (@UserId, 'UNAUTHORIZED_ACCESS', '/api/documents/it-passwords.txt', 'Failed', '192.168.1.10', 'Mozilla/5.0', DATEADD(day, -2, @Now));

-- Ngày 4: Vi phạm 1 lần (Bình thường)
INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo, CreatedAt)
VALUES (@UserId, 'UNAUTHORIZED_ACCESS', '/api/documents/legal-contract.pdf', 'Failed', '192.168.1.10', 'Mozilla/5.0', DATEADD(day, -1, @Now));

-- Ngày 5 (Hôm nay): Giả lập thêm vài lần vi phạm để Z-Score tăng vọt
INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo, CreatedAt)
VALUES (@UserId, 'UNAUTHORIZED_ACCESS', 'SCANNING_ATTEMPT', 'Failed', '::1', 'Postman', @Now);
INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo, CreatedAt)
VALUES (@UserId, 'UNAUTHORIZED_ACCESS', 'SCANNING_ATTEMPT', 'Failed', '::1', 'Postman', DATEADD(second, 1, @Now));
INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo, CreatedAt)
VALUES (@UserId, 'UNAUTHORIZED_ACCESS', 'SCANNING_ATTEMPT', 'Failed', '::1', 'Postman', DATEADD(second, 2, @Now));