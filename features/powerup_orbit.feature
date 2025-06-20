Feature: Power-up orbit
  Scenario: Power-ups spawn in orbit and move around the planet
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I set the next power-up spawn to 0 ms
    And I wait for 100 ms
    Then a power-up should be visible
    When I record the power-up position
    And I wait for 1200 ms
    Then the power-up should have moved
