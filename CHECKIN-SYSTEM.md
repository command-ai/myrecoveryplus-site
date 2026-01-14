# MyRecoveryPlus Check-In System

Complete implementation of the mobile cryotherapy check-in system with three initiation paths: client QR code, provider admin, and SMS.

## System Overview

The check-in system follows the flow diagram in `checkin-flow.mermaid` and implements:

1. **Client-Initiated Check-In** (QR Code Path)
2. **Provider-Initiated Check-In** (Admin Interface)
3. **SMS-Initiated Check-In** (Twilio Integration - Ready for Implementation)

All three paths converge on the same backend processing logic that:
- Validates client identity
- Checks package status
- Decrements session count
- Returns appropriate response

---

## Implementation Details

### 1. Client Check-In Page (`/pages/checkin.html`)

**Purpose:** Clients scan a QR code or text "IN" to receive a link to this page.

**Features:**
- Auto-formatting phone input: `(707) 555-0123`
- Real-time validation
- Three result states: Success (green), Warning (yellow), Error (red)
- Session count display
- Auto-reset after 5 seconds on success

**Flow:**
```
1. Client enters phone number
2. System validates format (10 digits)
3. Backend lookup by phone
4. Check package status
5. Display result with remaining sessions
```

**Test Data:**
| Phone Number | Client Name | Package | Sessions | Result |
|--------------|-------------|---------|----------|--------|
| (707) 761-0000 | John Doe | 8-session | 7 | ✓ Success |
| (707) 761-0001 | Jane Smith | 4-session | 1 | ✓ Success (last session) |
| (707) 761-0002 | Bob Johnson | 4-session | 0 | ⚠ Sessions Exhausted |
| (707) 761-0003 | Alice Brown | 8-session (expired) | N/A | ⚠ Package Expired |
| (707) 761-0004 | Charlie Davis | No package | N/A | ✕ No Package Found |
| (555) 555-5555 | Unknown | N/A | N/A | ✕ Client Not Found |

**URL:** `http://localhost:8000/pages/checkin.html`

---

### 2. Admin Check-In Interface (`/pages/admin-checkin.html`)

**Purpose:** Provider-initiated check-ins at client location.

**Features:**
- Search by name or phone number
- Real-time client card display
- Package status badges (Active, Expired, Exhausted, No Package)
- One-click check-in
- Toast notifications (success/warning/error)
- Session count updates in real-time

**Flow:**
```
1. Provider opens admin page
2. Searches for client (name or phone)
3. Reviews client package status
4. Clicks "CHECK IN" button
5. Toast confirmation appears
6. Session count decrements
7. Ready for next client
```

**UI Elements:**
- **Active Badge** (Green): Client has sessions remaining
- **Exhausted Badge** (Yellow): All sessions used
- **Expired Badge** (Red): Package expired
- **No Package Badge** (Red): No active package

**URL:** `http://localhost:8000/pages/admin-checkin.html`

---

### 3. SMS Integration (Ready for Twilio)

**Implementation Status:** Backend logic ready, needs Twilio webhook configuration

**How It Will Work:**

#### Inbound SMS Flow
```
1. Client texts "IN" to business number (e.g., 707-761-1528)
2. Twilio webhook receives SMS → POST /api/checkin/sms
3. Extract sender phone number from Twilio payload
4. Run same backend check-in logic
5. Return TwiML response with check-in result
6. Client receives SMS: "✓ Check-in successful! 6 sessions remaining"
```

#### Twilio Webhook Endpoint (To Be Implemented)
```javascript
// POST /api/checkin/sms
app.post('/api/checkin/sms', async (req, res) => {
    const phone = req.body.From; // Twilio format: +17077610000
    const message = req.body.Body.trim().toUpperCase();

    if (message === 'IN') {
        const result = await processCheckin(phone);

        // Return TwiML
        res.type('text/xml');
        res.send(`
            <Response>
                <Message>${formatSMSResponse(result)}</Message>
            </Response>
        `);
    }
});
```

#### SMS Response Templates
```javascript
const SMS_TEMPLATES = {
    success: '✓ Check-in successful! Welcome {name}. {sessions} session(s) remaining.',
    exhausted: '⚠ All sessions used. Please purchase a new package: recoveryplus.com/pricing',
    expired: '⚠ Your package has expired. Renew now: recoveryplus.com/pricing',
    no_package: '✕ No package found. Purchase here: recoveryplus.com/pricing',
    unknown: '✕ Client not found. Call us at 707-761-1528 to set up your account.'
};
```

---

## Backend Processing Logic

All three paths use the same core logic:

```javascript
async function processCheckin(phone) {
    // 1. Look up client by phone/ID
    const client = await lookupClient(phone);

    if (!client) {
        return { success: false, type: 'unknown' };
    }

    // 2. Find active package
    const pkg = await findActivePackage(client.id);

    if (!pkg) {
        return { success: false, type: 'no_package' };
    }

    // 3. Check if expired
    if (pkg.expired) {
        return { success: false, type: 'expired' };
    }

    // 4. Check sessions remaining
    if (pkg.sessions === 0) {
        return { success: false, type: 'exhausted' };
    }

    // 5. Decrement session count
    await decrementSession(pkg.id);

    // 6. Log check-in
    await logCheckin({
        client_id: client.id,
        package_id: pkg.id,
        timestamp: new Date(),
        source: 'qr' | 'admin' | 'sms'
    });

    return {
        success: true,
        remaining: pkg.sessions - 1,
        message: `Check-in successful! Welcome, ${client.name}!`
    };
}
```

---

## Response Delivery

### Client QR Code Path
- **Display:** On-screen result message (green/yellow/red)
- **Format:** Visual card with icon, title, message, and session count
- **Duration:** 5-second display, then auto-reset

### Admin Interface
- **Display:** Toast notification (top-right corner)
- **Format:** Icon + Title + Message
- **Duration:** 4-second slide-in/slide-out animation
- **Plus:** Real-time session count update on client card

### SMS Path (When Implemented)
- **Display:** SMS reply from business number
- **Format:** Plain text with emoji icons
- **Timing:** Immediate response (< 2 seconds)

---

## Security Considerations

### Implemented
- ✅ Safe DOM manipulation (no innerHTML for user data)
- ✅ Phone number validation (10-digit format)
- ✅ XSS prevention (textContent for all dynamic text)
- ✅ Input sanitization

### To Implement in Production
- ⚠️ Replace mock database with real backend API
- ⚠️ Add authentication for admin interface
- ⚠️ Implement rate limiting (prevent check-in spam)
- ⚠️ Add HTTPS for all endpoints
- ⚠️ Sanitize Twilio webhook inputs
- ⚠️ Add CSRF protection for admin endpoints

---

## QR Code Generation

### For Client Check-In Page

**URL to Encode:** `https://myrecoveryplus.com/checkin`

**Generate QR Code Using:**
1. **QR Code Generator** (https://www.qr-code-generator.com/)
2. **QRCode.js** Library (for dynamic generation)
3. **Command Line:**
   ```bash
   qrencode -o checkin-qr.png "https://myrecoveryplus.com/checkin"
   ```

**Usage:**
- Print on business cards
- Display at service locations
- Include in appointment confirmation emails
- Post at entrance of mobile unit

**QR Code Best Practices:**
- Size: Minimum 2x2 inches for reliable scanning
- Format: PNG or SVG for crisp rendering
- Color: High contrast (dark on light background)
- Placement: Eye-level, well-lit areas

---

## Testing Instructions

### Test Client Check-In (QR Code Path)
1. Navigate to `http://localhost:8000/pages/checkin.html`
2. Enter test phone numbers (see Test Data table above)
3. Verify success/warning/error states
4. Check session count display
5. Confirm auto-reset after 5 seconds

### Test Admin Check-In
1. Navigate to `http://localhost:8000/pages/admin-checkin.html`
2. Search for "John Doe" or phone "7077610000"
3. Click "CHECK IN" button
4. Verify toast notification appears
5. Confirm session count decrements (7 → 6)
6. Search for "Bob Johnson" (0 sessions)
7. Verify warning badge and disabled check-in button

### Test SMS Integration (When Implemented)
1. Configure Twilio webhook URL
2. Text "IN" to business number
3. Verify SMS reply received
4. Check session count in database
5. Test all response types (success, exhausted, expired, etc.)

---

## Production Deployment Checklist

### Frontend
- [ ] Replace localhost URLs with production domain
- [ ] Add Google Analytics or tracking
- [ ] Optimize images and assets
- [ ] Enable HTTPS
- [ ] Test on multiple devices (iOS, Android)
- [ ] Verify QR code scanning works

### Backend API
- [ ] Replace mock database with real PostgreSQL/MySQL
- [ ] Implement authentication (JWT or session-based)
- [ ] Add rate limiting middleware
- [ ] Set up logging (Winston, Sentry)
- [ ] Configure environment variables
- [ ] Add database connection pooling
- [ ] Implement transaction safety for session decrements

### Twilio Integration
- [ ] Purchase Twilio phone number
- [ ] Configure webhook URL in Twilio console
- [ ] Test SMS delivery
- [ ] Set up Twilio error handling
- [ ] Monitor SMS costs
- [ ] Add SMS rate limiting

### Security
- [ ] Enable CORS properly
- [ ] Add helmet.js for security headers
- [ ] Implement CSRF tokens
- [ ] Add input validation on backend
- [ ] Set up SSL/TLS certificates
- [ ] Add security monitoring

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Track check-in metrics
- [ ] Monitor session counts
- [ ] Alert on failed check-ins

---

## File Structure

```
myrecoveryplus-site/
├── pages/
│   ├── checkin.html           # Client QR code check-in page
│   ├── admin-checkin.html     # Provider admin interface
│   └── booking.html           # Multi-session booking (implemented)
├── css/
│   └── main.css               # Shared styles
├── js/
│   └── main.js                # Global scripts (theme, nav)
├── CHECKIN-SYSTEM.md          # This documentation
└── checkin-flow.mermaid       # System flow diagram
```

---

## API Endpoints (To Be Implemented)

### POST /api/checkin/client
**Purpose:** Client-initiated check-in from QR code page

**Request:**
```json
{
  "phone": "7077610000",
  "source": "qr"
}
```

**Response:**
```json
{
  "success": true,
  "remaining": 6,
  "message": "Check-in successful! Welcome, John Doe!",
  "clientName": "John Doe"
}
```

### POST /api/checkin/admin
**Purpose:** Admin-initiated check-in

**Headers:** `Authorization: Bearer <jwt_token>`

**Request:**
```json
{
  "phone": "7077610000",
  "providerId": "admin_123",
  "source": "admin"
}
```

**Response:** Same as client endpoint

### POST /api/checkin/sms
**Purpose:** Twilio webhook for SMS check-ins

**Request:** (Twilio format)
```
From=+17077610000
Body=IN
MessageSid=SM...
```

**Response:** (TwiML)
```xml
<Response>
    <Message>✓ Check-in successful! 6 sessions remaining.</Message>
</Response>
```

---

## Database Schema (Suggested)

### clients table
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### packages table
```sql
CREATE TABLE packages (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    type VARCHAR(50) NOT NULL,
    total_sessions INT NOT NULL,
    sessions_remaining INT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    expired BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);
```

### checkins table
```sql
CREATE TABLE checkins (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    package_id UUID REFERENCES packages(id),
    source VARCHAR(20) NOT NULL, -- 'qr', 'admin', 'sms'
    provider_id UUID REFERENCES admins(id),
    timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## Support and Troubleshooting

### Common Issues

**"Client not found" but phone is correct**
- Check phone number format in database (should be 10 digits, no formatting)
- Verify area code matches (707)

**Sessions not decrementing**
- Check database transaction commits
- Verify package_id is correct
- Check for concurrent check-in conflicts

**QR code not working**
- Verify URL is correct and accessible
- Test QR code with multiple scanner apps
- Ensure adequate lighting for scanning

**Toast notifications not appearing**
- Check browser console for JavaScript errors
- Verify CSS animations are enabled
- Test in different browsers

---

## Future Enhancements

### Planned Features
- [ ] Check-in history view (per client)
- [ ] Package expiration reminders (email/SMS)
- [ ] Analytics dashboard (daily check-ins, popular times)
- [ ] Multi-location support
- [ ] Client self-service portal
- [ ] Package pause/freeze functionality
- [ ] Referral tracking through QR codes
- [ ] Integration with Square/Stripe for upsells

### Advanced Features
- [ ] Geolocation verification (ensure check-in at correct location)
- [ ] Appointment scheduling integration
- [ ] Automated follow-up SMS after sessions
- [ ] Photo capture during check-in (before/after tracking)
- [ ] Integration with health tracking apps

---

## Contact and Support

**Technical Questions:** brian.recoveryplus@outlook.com
**Business Number:** 707-761-1528
**Website:** myrecoveryplus.com

**System Implemented:** January 2026
**Last Updated:** January 13, 2026
