const express = require("express");
const currentDistributionRoutes = require("./currentDistribution");
const distributionRoutes = require("./distribution");
const distributionsRoutes = require("./distributions");
const distributionIdRoutes = require("./distributionId");
const votingDistributionsRoutes = require("./votingDistributions");

const router = express.Router();

router.use("/", currentDistributionRoutes);
router.use("/", distributionRoutes);
router.use("/", distributionsRoutes);
router.use("/", distributionIdRoutes);
router.use("/", votingDistributionsRoutes);

module.exports = router;
