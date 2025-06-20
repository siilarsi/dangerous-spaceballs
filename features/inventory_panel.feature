Feature: Inventory panel
  Scenario: Baseline stats displayed on the start screen
    Given I open the game page
    Then the inventory panel should be visible
    And the inventory stat "Fuel Capacity" should be "200"
    And the inventory stat "Ammo Limit" should be "50"
    And the inventory stat "Boost Thrust" should be "200"
    And the inventory stat "Shield Duration" should be "0"

  Scenario: Stat icons are shown next to values
    Given I open the game page
    Then the inventory panel should be visible
    And the inventory stat icon for "Fuel Capacity" should be "⛽"
    And the inventory stat icon for "Ammo Limit" should be "🔫"
    And the inventory stat icon for "Boost Thrust" should be "🚀"
    And the inventory stat icon for "Shield Duration" should be "🛡️"

  Scenario: Purchased upgrades update stats after returning
    Given I open the game page
    And I have 10 credits
    When I open the shop tab
    And I buy the upgrade "Increase Max Ammo"
    And I buy the upgrade "Extra Starting Fuel"
    And I buy the upgrade "Temporary Shield"
    When I reload the page
    Then the inventory stat "Fuel Capacity" should be "250"
    And the inventory stat "Ammo Limit" should be "100"
    And the inventory stat "Shield Duration" should be "1"

  Scenario: Stats update immediately after buying while previewing
    Given I open the game page
    And I have 10 credits
    When I open the shop tab
    And I hover over the upgrade "Extra Starting Fuel"
    And I click buy on the upgrade "Extra Starting Fuel"
    Then the inventory stat "Fuel Capacity" should be "250"
