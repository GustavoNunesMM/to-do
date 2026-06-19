@echo off
powershell -Command "Start-Process wt -ArgumentList 'new-tab --title \"Next.js Dev\" -d \"C:\Users\Usuario\Documents\estudos\to-do\" cmd /k \"pnpm.CMD run dev\" `; new-tab --title \"Flutter Run\" -d \"C:\Users\Usuario\Documents\estudos\to-do\flutter_app\" cmd /k flutter run --no-pub'"
