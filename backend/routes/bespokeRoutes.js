const express = require("express");
const bespokeController = require("../controllers/bespokeController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// User routes
router.post("/create-request", protect, bespokeController.createBespokeRequest);
router.get("/my-requests", protect, bespokeController.getUserBespokeRequests);
router.get("/:requestId", protect, bespokeController.getBespokeRequestDetail);

// Admin routes
router.get(
  "/admin/all-requests",
  protect,
  restrictTo("admin"),
  bespokeController.getAllBespokeRequests,
);
router.patch(
  "/admin/:requestId",
  protect,
  restrictTo("admin"),
  bespokeController.updateBespokeRequestStatus,
);
router.delete(
  "/admin/:requestId",
  protect,
  restrictTo("admin"),
  bespokeController.deleteBespokeRequest,
);

module.exports = router;
