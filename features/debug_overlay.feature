Feature: Hitbox debug overlay
  Scenario: Enabling debug mode shows collision shapes
    Given I open the game page with debug enabled
    When I click the start screen
    Then the debug overlay should be active

  Scenario: Debug data exposes ship circle
    Given I open the game page with debug enabled
    When I click the start screen
    Then the debug overlay should be active
    And the ship debug data should include circle info

  Scenario: Ship hitbox circle uses tuned radius
    Given I open the game page with debug enabled
    When I click the start screen
    Then the debug overlay should be active
    And the ship hitbox radius should be 23
