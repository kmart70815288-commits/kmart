# Supermarket Mall — Local Run

مجلد المشروع يحتوي فرونت آند وباك آند جاهزين.

1. ادخل المجلد backend:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. افتح المتصفح: http://localhost:3000

## ملاحظات
- كلمة مرور الادمن الافتراضية: admin123
- لتعديل أو إضافة منتجات استخدم endpoint POST /api/admin/products مع هيدر x-admin-pass: admin123
- لربط بوابة دفع ستحتاج إضافة endpoint دفع وتجربة مع مزوّد مثل Stripe أو PayPal.