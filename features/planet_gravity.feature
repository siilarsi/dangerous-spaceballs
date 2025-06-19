Feature: Planetary gravity
  Scenario: Planets pull on the ship
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I record the ship position
    And I spawn a planet offset by 140 0 from the ship
    Then the planet radius should be 80
    And I wait for 1000 ms
    Then the ship should have moved
