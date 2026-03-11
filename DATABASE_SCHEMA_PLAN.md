# 📊 مشروع DoItByAI: هيكلة قاعدة البيانات (Database Schema Design)
**الإصدار:** 1.0 (تخطيط صامت)
**الحالة:** استراتيجي - غير مدمج في الكود الحالي

هذه الوثيقة ترسم الهيكل البرمجي لقاعدة البيانات المستقبلية (PostgreSQL/Supabase) لضمان الانتقال السلس من الملفات الثابتة إلى المنصة الديناميكية.

---

## 🏗️ 1. الجداول الأساسية (Core Tables)

### **أ. جدول الأدوات (`tools`)**
يخزن البيانات الأساسية لكل أداة ذكاء اصطناعي.

| الحقل (Field) | النوع (Type) | الوصف |
| :--- | :--- | :--- |
| `id` | `uuid` | المعرف الفريد (Primary Key) |
| `name` | `text` | اسم الأداة |
| `slug` | `text` | الرابط اللطيف (Unique URL Slug) |
| `short_desc` | `text` | وصف مختصر |
| `long_desc` | `text` | مراجعة شاملة ومفصلة |
| `category_id` | `uuid` | ربط بجدول التصنيفات (Foreign Key) |
| `logo_url` | `text` | رابط شعار الأداة |
| `website_url` | `text` | رابط الموقع الرسمي (Affiliate link) |
| `pricing_type` | `enum` | (Free, Paid, Freemium, Trial) |
| `featured` | `boolean` | هل هي أداة مميزة؟ (Default: false) |
| `created_at` | `timestamp` | تاريخ الإضافة |
| `updated_at` | `timestamp` | تاريخ آخر تحديث |

### **ب. جدول التصنيفات (`categories`)**
لتنظيم الأدوات وتسهيل الفلترة.

| الحقل (Field) | النوع (Type) | الوصف |
| :--- | :--- | :--- |
| `id` | `uuid` | المعرف الفريد |
| `name` | `text` | اسم التصنيف (مثال: توليد فيديوهات) |
| `slug` | `text` | الرابط اللطيف للتصنيف |
| `icon` | `text` | أيقونة التصنيف (Lucide/FontAwesome) |

---

## 👥 2. جداول المجتمع والتفاعل (Community & Engagement)

### **ج. جدول المراجعات والتقييمات (`reviews`)**
سيسمح للمستخدمين بإضافة تقييماتهم الحقيقية.

| الحقل (Field) | النوع (Type) | الوصف |
| :--- | :--- | :--- |
| `id` | `uuid` | المعرف الفريد |
| `tool_id` | `uuid` | المعرف الخاص بالأداة المقيمة |
| `user_name` | `text` | اسم المقيّم (أو ربطه بجدول المستخدمين لاحقاً) |
| `rating` | `int` | التقييم من 1 إلى 5 |
| `comment` | `text` | نص المراجعة |
| `created_at` | `timestamp` | تاريخ التقييم |

### **د. جدول الوسوم (`tags`)**
للبحث المتقدم (مثال: #No_Code, #Open_Source).

| الحقل (Field) | النوع (Type) | الوصف |
| :--- | :--- | :--- |
| `id` | `uuid` | المعرف الفريد |
| `name` | `text` | اسم الوسم |

---

## 📈 3. جداول البيانات المنظمة (Structured Data)

### **هـ. جدول المواصفات التقنية (`tool_specs`)**
للمقارنات البرمجية (Programmatic Comparisons).

| الحقل (Field) | النوع (Type) | الوصف |
| :--- | :--- | :--- |
| `id` | `uuid` | المعرف الفريد |
| `tool_id` | `uuid` | ربط بالأداة |
| `spec_key` | `text` | الخاصية (مثال: جودة الفيديو المعالجة) |
| `spec_value` | `text` | القيمة (مثال: 4K) |

---

## 🛠️ 4. كود الإنشاء المقترح (SQL Preview)

```sql
-- تفعيل ملحق UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول التصنيفات
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الأدوات
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_desc TEXT,
    long_desc TEXT,
    logo_url TEXT,
    website_url TEXT,
    pricing_type TEXT CHECK (pricing_type IN ('Free', 'Paid', 'Freemium', 'Trial')),
    category_id UUID REFERENCES categories(id),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للبحث السريع عن طريق الـ Slug
CREATE INDEX idx_tools_slug ON tools(slug);
```

---

## 🔄 5. خطة ترحيل البيانات (Migration Strategy)
1. **تصدير:** تحويل ملف `tools.json` الحالي إلى صيغة CSV أو JSON متوافقة مع جداول SQL.
2. **استيراد:** استخدام سكربت Node.js (Migration Script) لرفع البيانات إلى Supabase.
3. **تحقق:** مطابقة المعرفات (Slugs) للتأكد من عدم تلف روابط الـ SEO الحالية.

---
**إعداد:** المبرمج الرئيسي (AI Agent)
**للمراجعة:** السكرتيرة نور / صاحب المنصة
