# TODO - ItraFume Fixes

## Admin dashboard + auth

- [ ] Fix Admin dashboard gating/Loader so Dashboard renders correctly for admins
- [ ] Ensure `/admin/dashboard-stats` response matches frontend expectations

## Mobile sign-in (cookie persistence)

- [x] Validate CORS + credentials + cookie `sameSite/secure` alignment
- [ ] Fix AuthProvider fetchMe / token payload & ensure role included

## Performance: slow admin APIs

- [x] Speed up `PATCH /admin/orders/:id/status` by making email send non-blocking
- [x] Speed up blocking email sends in auth + payment flows (register/login/order/payment)
- [ ] Add Mongo indexes for order dashboard + filters

- [ ] (Optional) reduce populate fields if needed

## Product cover image

- [ ] Add `coverMediaUrl` (or `coverMedia`) to Product model
- [ ] Update admin product UI to allow selecting cover among uploaded media
- [ ] Update product display endpoints to use cover image

## Product media removal

- [ ] Make `removeMedia` safe: don’t unlink wrong path; only unlink if file exists and is part of product
- [ ] Audit any scheduled cleanup (if exists) and disable/limit it

## Admin order status refresh

- [ ] Ensure Orders page updates UI correctly after status change (refetch or use returned order)
