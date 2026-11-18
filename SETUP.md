# הגדרת INSPECTOR בענן

## 1. Supabase

1. צרו מיזם חדש.
2. פתחו את SQL Editor והריצו את הקובץ:
   `supabase/migrations/20261118_create_inspection_requests.sql`
3. באזור Authentication > Providers הפעילו את Google בלבד.
4. באזור Authentication > URL Configuration הגדירו:
   - Site URL: כתובת הייצור ב-Vercel.
   - Redirect URLs: הכתובת המקומית וכתובות Vercel הנדרשות.
5. העתיקו את Project URL ואת Publishable key.

אין להעתיק לאפליקציה את `service_role` או סיסמת מסד הנתונים.

## 2. Google Cloud

1. צרו או בחרו מיזם.
2. הגדירו OAuth consent screen.
3. צרו OAuth Client מסוג Web application.
4. הוסיפו Authorized redirect URI:
   `https://PROJECT_REF.supabase.co/auth/v1/callback`
5. העתיקו את Client ID ואת Client Secret להגדרות Google ב-Supabase.
6. כל עוד האפליקציה במצב בדיקה, הוסיפו את חשבונות הבדיקה המורשים.

## 3. פיתוח מקומי

1. העתיקו את `.env.example` אל `.env.local`.
2. מלאו:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. הריצו `pnpm install` ולאחר מכן `pnpm dev`.
4. פתחו את הכתובת המקומית שמציג Vite.

## 4. Vercel

1. העלו את הקוד למאגר Git פרטי.
2. צרו מיזם חדש ב-Vercel ובחרו את התיקייה `work/inspector-site` כתיקיית השורש.
3. הוסיפו את שני משתני הסביבה מ-Supabase לסביבות Preview ו-Production.
4. פרסו תחילה Preview ובדקו התחברות, שמירה והפרדת משתמשים.
5. לאחר קבלת כתובת הייצור, הוסיפו אותה ב-Supabase ל-Site URL ול-Redirect URLs.

## בדיקות קבלה

- משתמש שאינו מחובר רואה מסך כניסה בלבד.
- ההתחברות זמינה באמצעות Google בלבד.
- משתמש יכול ליצור פנייה ולראות אותה לאחר רענון.
- משתמש שני אינו רואה את הפנייה של המשתמש הראשון.
- השליחה ל-WhatsApp ממשיכה לעבוד לאחר השמירה.
- אין מפתחות סודיים במאגר או בקוד שנשלח לדפדפן.
