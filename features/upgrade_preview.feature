Feature: Upgrade preview
  Scenario: Hovering an upgrade shows stat changes
    Given I open the game page
    And I have 10 credits
    When I open the shop tab
    And I hover over the upgrade "Extra Starting Fuel"
    Then the inventory stat "Fuel Capacity" should preview "200 → 250"
    And the inventory stat "Fuel Capacity" should be highlighted
    When I stop hovering
    Then the inventory stat "Fuel Capacity" should be "200"
