Feature: Purchasing upgrades
  Scenario: Buying an upgrade applies next run
    Given I open the game page
    And I have 5 credits
    When I buy the upgrade "Max Ammo"
    Then the displayed credits should be 0
    And the inventory stat "Ammo Limit" should be "100"
    When I click the start screen
    Then the game should appear after a short delay
    And my ammo should be 100
