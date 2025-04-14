// __tests__/BodyWeightHistory.test.tsx

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BodyWeightHistory from "@/app/screens/workout/BodyWeightHistoryScreen"; // Adjust the path as needed
import { GlobalContext } from "@/context/GlobalContext";

// Minimal mock for the context
const mockGlobalContextValue = {
  data: {
    token: "fake-token",
  },
  isDarkMode: false,
};

describe("BodyWeightHistory Tests", () => {
  it("renders the screen heading", () => {
    const { getByText } = render(
      <GlobalContext.Provider value={mockGlobalContextValue as any}>
        <BodyWeightHistory />
      </GlobalContext.Provider>
    );
    
    // Confirm the main heading appears
    expect(getByText("Body Weight History")).toBeTruthy();
  });

  it("shows 'No weight data to display.' by default", () => {
    const { getByText } = render(
      <GlobalContext.Provider value={mockGlobalContextValue as any}>
        <BodyWeightHistory />
      </GlobalContext.Provider>
    );

    // Checks the no-data message
    expect(getByText("No weight data to display.")).toBeTruthy();
  });

  it("displays and presses the 'Record Weight' button", () => {
    const { getByText } = render(
      <GlobalContext.Provider value={mockGlobalContextValue as any}>
        <BodyWeightHistory />
      </GlobalContext.Provider>
    );

    // Look for the button
    const recordButton = getByText("Record Weight");
    expect(recordButton).toBeTruthy();

    // Fire a press event, just to show it doesn’t crash
    fireEvent.press(recordButton);
  });
});
