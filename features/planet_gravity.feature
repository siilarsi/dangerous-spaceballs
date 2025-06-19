Feature: Planetary gravity
  Scenario: Planets pull on the ship
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I record the ship position
    And I spawn a planet offset by 140 0 from the ship
    Then the planet radius should be 100
    And I wait for 1500 ms
    Then the ship should have moved

  Scenario: Planets display visible atmospheres
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    Then planet atmospheres should be visible
