Feature: Ship boundary bounce
  Scenario: Ship rebounds off the left wall
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I place the ship at 10 300 with velocity -200 0
    And I wait for 250 ms
    Then the ship x velocity should be positive
    And the ship should be within the screen bounds
