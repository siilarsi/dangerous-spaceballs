Feature: Hitbox debug overlay
  Scenario: Enabling debug mode shows collision shapes
    Given I open the game page with debug enabled
    When I click the start screen
    Then the debug overlay should be active
