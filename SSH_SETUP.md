# SSH Key Setup for GCP VM

## Copy this public key to your GCP VM:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCskpmteb4iFaSzSw6wDP9sf1OtmNCDC2AYU1xFmNzOLJCCOe6th0ZRL2L3AWVljb6sCd2JskknLHYwP0vPwT7b+h+N2PgvzR/N6VzIEJ6MrIznV6VVQcz0f0bUEsx6jueNG0gT8fpj5494g7Zj9TfRzM+XEScLwe63/E7x49tfyUJ3DymNc75kbmc57VZ6UZ4hONB0DrYZvpjDBb9rZFVOlC9Ww/ZOmLEnc0tacN8OdpkYVf2F/+FF73FO1rRK6n7YIa4A/f43WGn5ZpZ/cnkh36INjGGlkijkWBz+opNDKNwVZ5Eu/K37MMHmu3jdSjTzW+Wa0IaZ3wRDNP6OxNvWQ3Bx2/OqpOIgas8cxVePHTXPSC126b7o4D4Iw4W/utJvH4OXbrCQgopC85xc7njp9dCB+wOP3OxXukhtBn13RJMInzW/ZyCJiy04PN7P3G2s54omTeeXAfvHy+1JXELzRUz1v5/pkoi36nEwUvd85DPgsTvy6kuv2KfcSV6ntB/8UFXpgJJ+bItJ6WAst6lh+vHucHE1V3r7B9l0KDQw3ZN1DrwR9OIxPpr61TNMqyADEKxGXCFN6xZHGDaSu67noT4THdkPzLyCOPx5yHa8BN3TEVXu5Pvrb3MBxmHeRDm6k3SsTD3POorEDRy8Y3W31lMnKkYo7Uo+mrEVSZZE1w== helpdesk-production-user-2025
```

## Steps:

1. **Add to GCP VM via Console:**
   - Go to: https://console.cloud.google.com/compute/instances
   - Click your VM instance
   - Click "EDIT"
   - Scroll to "SSH Keys" section
   - Click "ADD ITEM"
   - Paste the entire key above
   - Click "SAVE"

2. **Username will be:** `helpdesk-production-user-2025`

3. **Test connection:**
   ```cmd
   ssh -i production_key helpdesk-production-user-2025@34.55.113.9
   ```
