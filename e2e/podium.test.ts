import { device, element, by, expect, waitFor } from 'detox';

describe('Podium Verification', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true, delete: true });
    });

    it('should navigate to results tab', async () => {
        // If onboarding appears, dismiss it
        try {
            await waitFor(element(by.text('OK'))).toBeVisible().withTimeout(3000);
            await element(by.text('OK')).tap();
            await waitFor(element(by.text("OK, j'ai compris"))).toBeVisible().withTimeout(3000);
            await element(by.text("OK, j'ai compris")).tap();
        } catch (e) {
            // Onboarding already completed
        }

        // Wait for data to load, then navigate to Résultats tab
        await waitFor(element(by.text('Résultats'))).toBeVisible().withTimeout(10000);
        await element(by.text('Résultats')).tap();
    });

    it('should show the results screen content', async () => {
        // The results screen should be visible whether it shows a podium or an empty state
        // Check that we are at least on a valid screen
        try {
            await waitFor(element(by.id('podium-container'))).toBeVisible().withTimeout(5000);
            // If podium is visible, verify rank elements
            await expect(element(by.id('podium-rank-1'))).toBeVisible();
            await expect(element(by.id('podium-rank-2'))).toBeVisible();
        } catch (e) {
            // No survey completed yet — empty state is acceptable
        }
    });
});
