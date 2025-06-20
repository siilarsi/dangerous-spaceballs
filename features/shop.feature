Feature: Shop access
  Scenario: Open shop from the start screen
    Given I open the game page
    When I open the shop tab
    Then the shop should list upgrades

  Scenario: Upgrades displayed as cards
    Given I open the game page
    When I open the shop tab
    Then each upgrade should appear as a card

  Scenario: Buying an upgrade does not start the game
    Given I open the game page
    And I have 10 credits
    When I open the shop tab
    And I click buy on the upgrade "Increase Max Ammo"
    Then the game should not be visible
    And the displayed credits should be 5
