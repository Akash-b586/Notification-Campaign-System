import { Router } from "express";
import {createCampaign,listCampaigns,getCampaign,previewCampaign,sendCampaign,getCampaignRecipients ,updateCampaign} from "../controllers/campaign.controller";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

router.post('/',authorize('ADMIN',"CREATOR"),createCampaign); // create campaign
router.patch('/:id',authorize("ADMIN", "CREATOR"),updateCampaign); // update campaign
router.post('/:id/send',authorize("ADMIN", "CREATOR"),sendCampaign); // send campaign
router.post('/:id/preview',authorize("ADMIN", "CREATOR","VIEWER"),previewCampaign); // preview campaign 

router.get('/',authorize(),listCampaigns); // list campaigns
router.get('/:id',authorize(),getCampaign); // get single campaign
router.get('/:id/recipients',authorize(),getCampaignRecipients); // get campaign recipients

// router.get('/:id/audience/count',authorize(),getAudienceCount);   // get audience count

export default router;
