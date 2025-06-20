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
    When I wait for 1000 ms
    Then the ship should have moved

  Scenario: Boosting results in lower top speed
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I hold the right mouse button for 500 ms
    When I release the right mouse button
    Then the ship speed should be below 150

  Scenario: Flame scales with thrust
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I hold the right mouse button for 300 ms
    Then the flame scale should be 1
    When I release the right mouse button
    When I set the ship boost thrust to 200
    When I hold the right mouse button for 300 ms
    Then the flame scale should be 2
    When I release the right mouse button
