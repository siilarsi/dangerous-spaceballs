Feature: Shop overlay
  Scenario: Viewing shop while docked
    Given I open the game page
    And the trader spawn interval is 100 ms
    When I click the start screen
    Then the game should appear after a short delay
    When I place the ship at 300 300 with velocity 0 0
    And I spawn the trader ship on the ship
    And I wait for 2100 ms
    Then the docking banner should be visible
    And the shop overlay should be visible
    And the shop credits should be 0
    And the shop stat "Ammo Limit" should be "50"
    When I click the undock button
    Then the shop overlay should not be visible
    And the docking banner should not be visible
    And the game should not be paused
