Feature: Urgent countdown display
  Scenario: Timer turns urgent when less than 10 seconds remain
    Given I open the game page
    When I click the start screen
    And the game should appear after a short delay
    And I force the timer below ten seconds
    Then the screen should tint red
