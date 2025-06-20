Feature: Trader ship sightings
  Scenario: Trader ship appears and moves
    Given I open the game page
    And the trader spawn interval is 200 ms
    When I click the start screen
    Then the game should appear after a short delay
    Then a trader ship should be visible
    When I record the trader ship position
    And I wait for 400 ms
    Then the trader ship should have moved

  Scenario: Colliding with the trader ship does not push the player
    Given I open the game page
    And the trader spawn interval is 1000 ms
    When I click the start screen
    Then the game should appear after a short delay
    When I place the ship at 300 300 with velocity 0 0
    And I record the ship position
    And I spawn the trader ship on the ship
    And I wait for 100 ms
    Then the ship should not have moved

  Scenario: Docking pauses the game
    Given I open the game page
    And the trader spawn interval is 100 ms
    When I click the start screen
    Then the game should appear after a short delay
    When I place the ship at 300 300 with velocity 0 0
    And I spawn the trader ship on the ship
    And I wait for 2100 ms
    Then the docking banner should be visible
    And the game should be paused
    When I click the undock button
    Then the docking banner should not be visible
    And the game should not be paused
