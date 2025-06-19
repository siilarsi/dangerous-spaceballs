Feature: Inventory panel
  Scenario: Baseline stats displayed on the start screen
    Given I open the game page
    Then the inventory panel should be visible
    And the inventory stat "Fuel Capacity" should be "200"
    And the inventory stat "Ammo Limit" should be "50"
    And the inventory stat "Boost Thrust" should be "200"
    And the inventory stat "Shield Duration" should be "0"
