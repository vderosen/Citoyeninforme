import { device, element, by, expect, waitFor } from 'detox';

describe('Survey Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true, delete: true });
    });

    it('should complete onboarding and land on the survey', async () => {
        // Step 1: Dismiss onboarding - tap "OK"
        await waitFor(element(by.text('OK'))).toBeVisible().withTimeout(15000);
        await element(by.text('OK')).tap();

        // Step 2: Dismiss onboarding - tap "OK, j'ai compris"
        await waitFor(element(by.text("OK, j'ai compris"))).toBeVisible().withTimeout(5000);
        await element(by.text("OK, j'ai compris")).tap();

        // After onboarding the app now lands directly on Cartes Swipe.
        await waitFor(element(by.id('active-card'))).toExist().withTimeout(15000);

        // Dismiss the tutorial overlay
        await waitFor(element(by.id('tutorial-dismiss'))).toBeVisible().withTimeout(5000);
        await element(by.id('tutorial-dismiss')).tap();

        // Tap the agree button to answer 'Agree', bypassing gesture visibility issues completely
        await element(by.id('btn-agree')).tap();

        // Wait for the next card to cycle in
        await waitFor(element(by.id('active-card'))).toExist().withTimeout(5000);
    });
});
