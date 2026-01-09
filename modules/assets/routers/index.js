import express from 'express';
import * as controller from '../controller.js';

const router = express.Router();

// router.get('/css', controller.redirectCSS);
// router.get('/js', controller.redirectJS);

// router.get('/links', controller.getLinks);

// router.get('/script.js', controller.getJs);
// router.get('/style.css', controller.getCss);

// Serve quote-form.iife.js based on domain mapping
router.get('/quote-form.iife.js', controller.getQuoteForm);

// Aliases for drop-in replacement
// router.get('/appy-tier3.js', controller.getJs);
// router.get('/appy-tier3.css', controller.getCss);

export default router;
