Feature: Thruster Boost
  Scenario: Activating the thruster consumes fuel and shows flame
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I hold the right mouse button for 300 ms
    Then the flame should be visible
    And the fuel should decrease
    When I release the right mouse button

  Scenario: Ship movement persists after boosting
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I record the ship position
    When I wait for 100 ms
    When I hold the right mouse button for 500 ms
    When I release the right mouse button
    When I wait for 200 ms
    Then the ship should have moved
