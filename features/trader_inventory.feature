Feature: Trader limited inventory
  Scenario: Buying out the stock marks it sold out
    Given I open the game page
    And I have 5 credits
    And I click the start screen
    Then the game should appear after a short delay
    When I spawn the trader ship with inventory "{\"max_ammo\":1}"
    And I wait for 2100 ms
    Then the shop overlay should be visible
    When I click buy on the upgrade "Max Ammo"
    Then the upgrade "Max Ammo" should show Sold Out

  Scenario: Stock resets for a new trader
    Given I open the game page
    And I have 5 credits
    And I click the start screen
    Then the game should appear after a short delay
    When I spawn the trader ship with inventory "{\"max_ammo\":1}"
    And I wait for 2100 ms
    When I click buy on the upgrade "Max Ammo"
    Then the upgrade "Max Ammo" should show Sold Out
    When I click the undock button
    And I spawn the trader ship with inventory "{\"max_ammo\":1}"
    And I wait for 2100 ms
    Then the upgrade "Max Ammo" should not show Sold Out
