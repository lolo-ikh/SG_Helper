// ===============================================
// SG ULTIMATE GOOGLE APPS SCRIPT (WITH AUTO-BOLDING)
// ===============================================

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // IDs (Ensure these matches your template)
        const templateId = '1ot_w5-UEhrnhrciLVh8CY1rTvUJ9PLYlfenrDt_rRFk';
        const folder = DriveApp.getRootFolder();

        // Create copy
        const fileCopy = DriveApp.getFileById(templateId).makeCopy(`Technical Card - ${data.title}`, folder);
        const doc = DocumentApp.openById(fileCopy.getId());
        const body = doc.getBody();

        const getBox = (isChecked) => isChecked ? "☑" : "☐";

        // 1. PERFORM TEXT REPLACEMENT
        body.replaceText('{{ref_num}}', data.ref_num || "");
        body.replaceText('{{date_write}}', data.date_write || "");
        body.replaceText('{{check_scientific}}', getBox(data.type === 'scientific'));
        body.replaceText('{{check_Cult}}', getBox(data.type === 'cultural'));
        body.replaceText('{{check_sport}}', getBox(data.type === 'sport'));

        body.replaceText('{{title}}', data.title || "");
        body.replaceText('{{place}}', data.place_name || "");
        body.replaceText('{{check_inside}}', getBox(data.is_inside === true));
        body.replaceText('{{check_outside}}', getBox(data.is_inside === false));

        body.replaceText('{{day}}', data.day_name || "");
        body.replaceText('{{date_activity}}', data.date_activity || "");
        body.replaceText('{{from}}', data.time_from || "");
        body.replaceText('{{to}}', data.time_to || "");

        body.replaceText('{{target_group}}', data.target_group || "");
        body.replaceText('{{coordination_with}}', data.coordination || "");

        body.replaceText('{{activity_obj}}', data.objectives || "");
        body.replaceText('{{theme}}', data.themes || "");
        body.replaceText('{{needs}}', data.needs || "");
        body.replaceText('{{agenda}}', data.agenda || "");

        body.replaceText('{{check_spon}}', getBox(data.is_sponsored === true));
        body.replaceText('{{check_nospon}}', getBox(data.is_sponsored === false));

        // 2. APPLY AUTO-BOLDING TO LISTS
        applyBoldToLists(body);

        doc.saveAndClose();

        return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            url: doc.getUrl()
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Scans the document for bullets (•) and numbered lists (1.)
 * and applies BOLD styling to the bullet/number itself.
 */
function applyBoldToLists(body) {
    const paragraphs = body.getParagraphs();

    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const text = p.getText();

        // Check for Bullet (starts with •)
        if (text.trim().startsWith('•')) {
            const startIndex = text.indexOf('•');
            p.setBold(startIndex, startIndex, true); // Bold just the •
        }

        // Check for Numbered List (starts with "1." or "10.")
        const numberMatch = text.match(/^\s*(\d+\.)/);
        if (numberMatch) {
            const numberText = numberMatch[1];
            const startIndex = text.indexOf(numberText);
            p.setBold(startIndex, startIndex + numberText.length - 1, true); // Bold the whole "1."
        }
    }
}

function doGet(e) {
    return ContentService.createTextOutput("Healthy").setMimeType(ContentService.MimeType.TEXT);
}
