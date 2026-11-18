import { test, expect } from "@playwright/test";

test("Create two bookings and verify", async ({ page }) => {
    // Sign in and open the events catalog.
    await page.goto("/login");
    await page.getByLabel("Email").fill("sktester@gmail.com");
    await page.getByLabel("Password").fill("Secret@123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("link", { name: "Browse Events →" }).click();

    await expect(
        page.getByRole("heading", { name: "Upcoming Events", level: 1 }),
    ).toBeVisible();

    // Create the first booking: Conference, Hyderabad, World, one ticket.
    await page
        .getByRole("combobox")
        .filter({ hasText: "All Categories" })
        .selectOption({ value: "Conference" });
    await page
        .getByRole("combobox")
        .filter({ hasText: "All Cities" })
        .selectOption({ value: "Hyderabad" });
    await page.getByPlaceholder("Search events, venues…").fill("World");
    const cards = page.getByTestId("event-card");
    const eventCard1 = cards.filter({ hasText: "World Tech Summit" });
    await eventCard1.getByRole("link", { name: "Book Now" }).click();
    await expect(
        page.getByRole("heading", { name: "World Tech Summit" }),
    ).toBeVisible();
    await expect(page.locator("#ticket-count")).toHaveText("1");
    await page.getByLabel("Full Name").fill("User One");
    await page.getByLabel("Email").fill("user_one@gmail.com");
    await page.getByLabel("Phone Number").fill("8569845214");
    await page.getByRole("button", { name: "Confirm Booking" }).click();
    await expect(
        page.getByRole("heading", { name: "Booking Confirmed!" }),
    ).toBeVisible();

    // Capture the first booking details for later comparisons.
    const firstBookingRef = await page.locator(".booking-ref").innerText();
    expect(firstBookingRef).not.toBe("");
    const firstEventTitle = await page
        .getByRole("heading", { name: "World Tech Summit" })
        .innerText();
    expect(firstEventTitle).toBe("World Tech Summit");
    const firstTicketCount = await page
        .locator("span", { hasText: "Tickets" })
        .locator("..")
        .locator(".font-medium")
        .innerText();
    expect(firstTicketCount).toBe("1");
    const firstTotal = await page
        .locator("span", { hasText: "Total" })
        .locator("..")
        .locator(".font-medium")
        .innerText();
    const firstCustomerEmail = "user_one@gmail.com";

    // Return to the catalog and create the second booking with two tickets.
    await page.getByRole("link", { name: "Browse More Events" }).click();

    await expect(
        page.getByRole("heading", { name: "Upcoming Events", level: 1 }),
    ).toBeVisible();
    await page
        .getByRole("combobox")
        .filter({ hasText: "All Categories" })
        .selectOption({ value: "Festival" });
    await page
        .getByRole("combobox")
        .filter({ hasText: "All Cities" })
        .selectOption({ value: "Delhi" });
    await page.getByPlaceholder("Search events, venues…").fill("Dilli");
    const eventCard2 = cards.filter({ hasText: "Dilli Diwali Mela" });
    await eventCard2.getByRole("link", { name: "Book Now" }).click();
    await expect(
        page.getByRole("heading", { name: "Dilli Diwali Mela" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator("#ticket-count")).toHaveText("2");
    await page.getByLabel("Full Name").fill("User Two");
    await page.getByLabel("Email").fill("user_two@gmail.com");
    await page.getByLabel("Phone Number").fill("9569845215");
    await page.getByRole("button", { name: "Confirm Booking" }).click();
    await expect(
        page.getByRole("heading", { name: "Booking Confirmed!" }),
    ).toBeVisible();

    // Capture the second booking details for later comparisons.
    const secondBookingRef = await page.locator(".booking-ref").innerText();
    expect(secondBookingRef).not.toBe("");
    const secondEventTitle = await page
        .getByRole("heading", { name: "Dilli Diwali Mela" })
        .innerText();
    expect(secondEventTitle).toBe("Dilli Diwali Mela");
    const secondTicketCount = await page
        .locator("span", { hasText: "Tickets" })
        .locator("..")
        .locator(".font-medium")
        .innerText();
    expect(secondTicketCount).toBe("2");
    const secondTotal = await page
        .locator("span", { hasText: "Total" })
        .locator("..")
        .locator(".font-medium")
        .innerText();
    const secondCustomerEmail = "user_two@gmail.com";

    // Verify that these are distinct bookings.
    expect(firstBookingRef).not.toBe(secondBookingRef);
    expect(firstEventTitle).not.toBe(secondEventTitle);

    await page.getByRole("button", { name: "View My Bookings" }).click();

    await expect(
        page.getByRole("heading", { name: "My Bookings", level: 1 }),
    ).toBeVisible();

    // Find cards by their captured references, never by list position.
    const bookingCard = page.getByTestId("booking-card");
    const firstBookingCard = bookingCard.filter({ hasText: firstBookingRef });
    const secondBookingCard = bookingCard.filter({ hasText: secondBookingRef });

    await expect(firstBookingCard).toBeVisible();
    await expect(secondBookingCard).toBeVisible();

    await expect(
        firstBookingCard.getByText("confirmed", { exact: true }),
    ).toBeVisible();
    await expect(
        secondBookingCard.getByText("confirmed", { exact: true }),
    ).toBeVisible();

    await expect(
        firstBookingCard.getByRole("heading", { name: "World Tech Summit" }),
    ).toHaveText(firstEventTitle);
    await expect(
        secondBookingCard.getByRole("heading", { name: "Dilli Diwali Mela" }),
    ).toHaveText(secondEventTitle);

    await expect(
        firstBookingCard.locator("span").filter({ hasText: "ticket" }),
    ).toHaveText("🎫 " + firstTicketCount + " ticket");
    await expect(
        secondBookingCard.locator("span").filter({ hasText: "ticket" }),
    ).toHaveText("🎫 " + secondTicketCount + " tickets");

    await expect(firstBookingCard.locator(".text-xl")).toHaveText(firstTotal);
    await expect(secondBookingCard.locator(".text-xl")).toHaveText(secondTotal);

    // Verify the first detail page against its captured booking data.
    await firstBookingCard.getByRole("button", { name: "View Details" }).click();
    await expect(
        page.getByRole("heading", { name: firstEventTitle, level: 1, exact: true }),
    ).toBeVisible();
    await expect(
        page
            .getByText("confirmed", { exact: true })
            .locator("..")
            .locator(".font-mono.bg-indigo-50"),
    ).toHaveText(firstBookingRef);
    await expect(
        page
            .getByText("Email", { exact: true })
            .locator("..")
            .locator(".font-medium"),
    ).toHaveText(firstCustomerEmail);
    await expect(
        page
            .getByText("Tickets", { exact: true })
            .locator("..")
            .locator(".font-medium"),
    ).toHaveText(firstTicketCount);
    await expect(
        page
            .getByText("Total Paid", { exact: true })
            .locator("..")
            .locator(".font-bold"),
    ).toHaveText(firstTotal);
    await expect(
        page
            .getByText("Booking ID", { exact: true })
            .locator("..")
            .locator(".font-medium"),
    ).toHaveText(/^#\d+$/);
    await page.getByRole("button", { name: "← Back to My Bookings" }).click();

    await expect(
        page.getByRole("heading", { name: "My Bookings", level: 1 }),
    ).toBeVisible();

    // Re-find the second card and verify its detail page.
    await secondBookingCard.getByRole("button", { name: "View Details" }).click();
    await expect(
        page.getByRole("heading", {
            name: secondEventTitle,
            level: 1,
            exact: true,
        }),
    ).toBeVisible();
    await expect(
        page
            .getByText("confirmed", { exact: true })
            .locator("..")
            .locator(".font-mono.bg-indigo-50"),
    ).toHaveText(secondBookingRef);
    await expect(
        page
            .getByText("Email", { exact: true })
            .locator("..")
            .locator(".font-medium"),
    ).toHaveText(secondCustomerEmail);
    await expect(
        page
            .getByText("Tickets", { exact: true })
            .locator("..")
            .locator(".font-medium"),
    ).toHaveText(secondTicketCount);
    await expect(
        page
            .getByText("Total Paid", { exact: true })
            .locator("..")
            .locator(".font-bold"),
    ).toHaveText(secondTotal);
    await expect(
        page
            .getByText("Booking ID", { exact: true })
            .locator("..")
            .locator(".font-medium"),
    ).toHaveText(/^#\d+$/);

    // Ensure the second detail page does not show the first booking reference.
    await expect(
        page.getByText(firstBookingRef, { exact: true }),
    ).not.toBeVisible();

    // Cancel only the two bookings created by this test, then log out.
    await page.getByRole("button", { name: "← Back to My Bookings" }).click();
    await expect(
        page.getByRole("heading", { name: "My Bookings", level: 1 }),
    ).toBeVisible();

    await firstBookingCard
        .getByRole("button", { name: "Cancel Booking" })
        .click();
    await expect(page.getByRole("dialog")).toContainText(firstBookingRef);
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Yes, cancel it" })
        .click();
    await expect(page.getByText("Booking cancelled successfully")).toBeVisible();
    await expect(firstBookingCard).toHaveCount(0);

    await secondBookingCard
        .getByRole("button", { name: "Cancel Booking" })
        .click();
    await expect(page.getByRole("dialog")).toContainText(secondBookingRef);
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Yes, cancel it" })
        .click();
    await expect(page.getByText("Booking cancelled successfully")).toBeVisible();
    await expect(secondBookingCard).toHaveCount(0);

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL("/login");
});
