Feature: Thruster Boost
  Scenario: Activating the thruster consumes fuel and shows flame
    Given I open the game page
    When I click the start button
    Then the game should appear after a short delay
    When I hold the right mouse button for 300 ms
    Then the flame should be visible
    And the fuel should decrease
    When I release the right mouse button
