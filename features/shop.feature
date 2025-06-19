Feature: Shop access
  Scenario: Open shop from the start screen
    Given I open the game page
    When I open the shop tab
    Then the shop should list upgrades

  Scenario: Upgrades displayed as cards
    Given I open the game page
    When I open the shop tab
    Then each upgrade should appear as a card
