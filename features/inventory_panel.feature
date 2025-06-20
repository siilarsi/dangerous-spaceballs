Feature: Inventory panel
  Scenario: Baseline stats displayed on the start screen
    Given I open the game page
    Then the inventory panel should be visible
    And the inventory stat "Fuel Capacity" should be "50"
    And the inventory stat "Ammo Limit" should be "25"
    And the inventory stat "Reload Time" should be "3500"
    And the inventory stat "Boost Thrust" should be "100"
    And the inventory stat "Shield Duration" should be "0"

  Scenario: Stat icons are shown next to values
    Given I open the game page
    Then the inventory panel should be visible
    And the inventory stat icon for "Fuel Capacity" should be "⛽"
    And the inventory stat icon for "Ammo Limit" should be "🔫"
    And the inventory stat icon for "Reload Time" should be "⚡"
    And the inventory stat icon for "Boost Thrust" should be "🚀"
    And the inventory stat icon for "Shield Duration" should be "🛡️"

  Scenario: No investment totals displayed
    Given I open the game page
    Then the inventory panel should be visible
    And the inventory panel should not show investment totals

