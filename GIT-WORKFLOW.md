# روال Git دادوین

شاخه `main` نسخه اصلی سایت است و ادغام و انتشار آن با مسئول بک‌اند است. شاخه ثابت فرانت `codex/frontend` است. شاخه سومِ پشتیبانی یا توسعه مشترک توسط تیم تعیین می‌شود؛ در این تغییر فقط شاخه فرانت ایجاد شده است.

## قبل از شروع کار

با working tree تمیز:

```sh
git status
git switch main
git pull --ff-only origin main
git switch codex/frontend
git merge main
```

دستور آخر فقط تغییرات main را وارد شاخه فرانت می‌کند؛ تغییرات فرانت را وارد main نمی‌کند. اگر فایل تغییرکرده یا conflict وجود داشت، ابتدا آن را حفظ و حل کنید. از reset یا پاک‌کردن فایل‌ها برای عبور از مشکل استفاده نکنید.

## ثبت و ارسال تغییرات

```sh
git add <files>
git commit -m "Describe the change"
git push origin codex/frontend
```

push روی main، force-push، ادغام در main و انتشار سایت از سمت فرانت انجام نمی‌شود. تحویل تغییرات از شاخه فرانت به مسئول بک‌اند صورت می‌گیرد.

## جلوگیری از push اشتباه

در این checkout، مسیر hook محلی تنظیم شده است:

```sh
git config --local core.hooksPath scripts/githooks
```

hook قبل از push مقصد main را مسدود می‌کند؛ `--no-verify` نباید استفاده شود. این تنظیم در clone تازه خودکار فعال نمی‌شود و باید در checkout فرانت دوباره تنظیم شود. محافظت مرکزی GitHub نیز در اختیار مدیر مخزن است؛ این hook جای آن را نمی‌گیرد.
