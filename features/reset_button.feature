Feature: Reset button
  Scenario: Reset button hidden during gameplay
    Given I open the game page
    Then the reset button should be visible
    When I click the start screen
    Then the game should appear after a short delay
    And the reset button should not be visible

  Scenario: Reset requires confirmation
    Given I open the game page
    And the high score is 50
    And I have 5 credits
    When I click the reset button
    Then the reset warning should be visible
    When I click the reset button
    Then the reset warning should not be visible
    And the displayed credits should be 0
    And the high score should be 0
