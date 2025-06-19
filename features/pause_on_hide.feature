Feature: Pause when hidden
  Scenario: Music and game pause when page is hidden
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    And I hide the page
    Then gameplay music should be paused
    And the game should be paused
