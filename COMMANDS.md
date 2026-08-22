# 🎯 EXECUTION COMMANDS - Copy & Paste Ready

## ⚡ START HERE - Run These Commands

---

### **COMMAND 1: Start the Server**

```bash
cd C:\Users\HP\contacts-app && npm start
```

**What you'll see:**
```
✓ Server running at http://localhost:3001
✓ Database: contacts.db
```

**Then open your browser:** http://localhost:3001

---

### **COMMAND 2: Import Your 70K Contacts**

*(Run this in a NEW terminal while server is running)*

```bash
cd C:\Users\HP\contacts-app && node import-csv.js "C:\Users\HP\Downloads\contacts (2)(in).csv"
```

**What you'll see:**
```
📂 Importing from: C:\Users\HP\contacts-app\contacts (2)(in).csv
✅ Import complete!
📊 Total rows: 70000
✔️  Imported: 68,500
⏭️  Skipped (duplicate/empty): 1,500
📈 Total contacts in database: 68,500
```

---

### **COMMAND 3: Verify All Emails (Optional)**

```bash
curl -X POST http://localhost:3001/api/contacts/verify-emails \
  -H "Content-Type: application/json" \
  -d '{"ids": []}'
```

**What happens:**
- Checks email syntax for all contacts
- Verifies MX records (mail servers)
- Updates status: valid/invalid/unknown

---

## 📊 CHECK YOUR DATA

### See Total Contacts
```bash
curl http://localhost:3001/api/stats
```

**Response:**
```json
{"total": 68500}
```

### Search Contacts
```bash
curl "http://localhost:3001/api/contacts?search=john&page=1&pageSize=10"
```

### Get Contacts from Kenya
```bash
curl "http://localhost:3001/api/contacts?search=.co.ke&page=1"
```

### Get All Valid Emails
```bash
curl "http://localhost:3001/api/contacts?emailStatus=valid&page=1"
```

---

## 💻 STEP-BY-STEP EXECUTION

### Step 1: Open PowerShell/Command Prompt

Press `Win + R`, type:
```
powershell
```

Then press Enter.

### Step 2: Start Server

Copy this and paste into PowerShell:

```bash
cd C:\Users\HP\contacts-app && npm start
```

**Press Enter.** Wait for:
```
✓ Server running at http://localhost:3001
✓ Database: contacts.db
```

### Step 3: Open Browser

While server is running, open your browser and go to:

```
http://localhost:3001
```

You should see:
```
📇 Contacts Manager
Contacts: 0 · Websites: 0
```

### Step 4: Import Contacts (New Terminal)

Open a **NEW** PowerShell/Command Prompt window (keep first one running).

Paste this:

```bash
cd C:\Users\HP\contacts-app && node import-csv.js "C:\Users\HP\Downloads\contacts (2)(in).csv"
```

**Press Enter.** Watch the import progress.

When done, you'll see:
```
✅ Import complete!
📈 Total contacts in database: 68,500
```

### Step 5: Refresh Browser

Go back to browser tab showing `http://localhost:3001` and press `F5` to refresh.

You should now see:
```
📇 Contacts Manager
Contacts: 68,500 · Websites: 0
```

🎉 **Done! Your app is live with 68,500 contacts!**

---

## 🎮 WHAT TO DO NEXT IN DASHBOARD

### Search Contacts
1. Type in search box: "john" or "gmail.com" or "+254"
2. See instant results

### Filter by Email Status
1. Select dropdown: "All email statuses"
2. Choose: "Valid emails only"
3. See verified contacts

### Add New Contact
1. Click **+ Add Contact**
2. Fill in details
3. Click **Save**

### Edit Contact
1. Find contact card
2. Click **Edit**
3. Modify info
4. Click **Save**

### Delete Contact
1. Click **Delete** on contact card
2. Confirm deletion

### Export to CSV
1. Click **Export CSV**
2. File downloads to Downloads folder
3. Open in Excel or Google Sheets

---

## 🔍 ADVANCED COMMANDS

### Bulk Update Contacts

```bash
curl -X POST http://localhost:3001/api/contacts/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {"firstName":"Test1","email":"test1@example.com"},
      {"firstName":"Test2","email":"test2@example.com"}
    ]
  }'
```

### Get Page 2 of Contacts

```bash
curl "http://localhost:3001/api/contacts?page=2&pageSize=50"
```

### Get Contacts from Specific Company

```bash
curl "http://localhost:3001/api/contacts?search=microsoft&pageSize=100"
```

### Delete a Contact

```bash
curl -X DELETE http://localhost:3001/api/contacts/123
```

---

## 🛑 STOP THE SERVER

In the PowerShell window running the server:

Press **Ctrl + C**

You'll see:
```
^C
```

Server stops. Database stays intact.

---

## 📁 FILE LOCATIONS

| File | Location |
|------|----------|
| Database | `C:\Users\HP\contacts-app\contacts.db` |
| Web App | `http://localhost:3001` |
| CSV File | `C:\Users\HP\Downloads\contacts (2)(in).csv` |
| API | `http://localhost:3001/api/*` |

---

## ✅ CHECKLIST

- [ ] Server running (`npm start`)
- [ ] Browser open at http://localhost:3001
- [ ] CSV imported (70K contacts)
- [ ] Can search contacts
- [ ] Can add new contact
- [ ] Can edit contact
- [ ] Can delete contact
- [ ] Can export to CSV
- [ ] Email verification working (optional)

---

## 🚀 READY?

**Start with Command 1 above!**

Copy and paste each command, press Enter, and follow the output.

Questions? Check `SETUP-GUIDE.md` for detailed explanations.

---

**Your Undugu Contacts App is ready to change your SEO game! 🚀**
